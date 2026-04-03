import { isLocationInIndia, searchLocations } from '../config/locations';
import type { Location } from '../config/locations';
import type { PipelineOptions, FilteredJob, LocationScope } from '../types/options';

export const normalizeLocation = (raw: string, options: PipelineOptions): {
  normalized: string;
  scope: LocationScope;
  locationId?: string;
} => {
  const lower = raw.toLowerCase().trim();

  // Remote patterns
  if (lower.includes('remote') && lower.includes('india')) {
    return { normalized: 'remote-india', scope: 'remote-india' };
  }
  if (lower.includes('remote') && (lower.includes('global') || lower.includes('worldwide'))) {
    return { normalized: 'remote-global', scope: 'remote-global' };
  }
  if (lower.includes('remote') && !lower.includes('india')) {
    return { normalized: 'remote-global', scope: 'remote-global' };
  }

  // Hybrid/Onsite patterns
  if (lower.includes('hybrid') || lower.includes('flexible')) {
    return { normalized: 'hybrid', scope: 'hybrid' };
  }

  // Try to match against known Indian locations
  const matches = searchLocations(raw);
  if (matches.length > 0 && matches[0]) {
    const bestMatch = matches[0];
    return {
      normalized: bestMatch.id,
      scope: options.locationScope === 'remote-india' ? 'remote-india' : 'onsite',
      locationId: bestMatch.id,
    };
  }

  // Fallback: detect if it's in India via keyword matching
  if (isLocationInIndia(raw)) {
    return { normalized: 'india-unspecified', scope: 'onsite' };
  }

  return { normalized: 'unknown', scope: 'any' };
};

export const matchesLocationFilter = (
  job: FilteredJob,
  options: PipelineOptions
): boolean => {
  const { locationScope, locations, locationRadius, remoteFromIndia } = options;

  if (!locationScope && !locations?.length && remoteFromIndia === undefined) {
    return true;
  }

  const jobScope = job.location.scope;
  const jobLocId = job.location.locationId;

  if (remoteFromIndia === true) {
    return (
      jobScope === 'remote-india' ||
      (jobScope === 'remote-global' && job.location.raw.toLowerCase().includes('india'))
    );
  }

  if (locationScope && locationScope !== 'any') {
    if (locationScope === 'remote-india') {
      if (jobScope === 'remote-india') return true;
      if (jobScope === 'remote-global' && job.location.raw.toLowerCase().includes('india')) {
        return true;
      }
      return false;
    }
    if (jobScope !== locationScope) {
      return false;
    }
  }

  if (locations?.length && jobLocId) {
    if (locations.includes(jobLocId)) return true;

    const jobLocation = searchLocations(jobLocId)[0];
    if (jobLocation?.state) {
      const stateId = `IN-${jobLocation.state.substring(0, 2).toUpperCase()}`;
      if (locations.includes(stateId)) return true;
    }
    if (jobLocation?.ut) {
      const utId = `IN-${jobLocation.ut.substring(0, 2).toUpperCase()}`;
      if (locations.includes(utId)) return true;
    }

    if (locationRadius && jobScope === 'hybrid') {
      const userLocations = locations.map((id) => searchLocations(id)[0]).filter(Boolean);
      const userStates = new Set(userLocations.map((l: any) => l.state || l.ut));
      if (jobLocation?.state && userStates.has(jobLocation.state)) return true;
      if (jobLocation?.ut && userStates.has(jobLocation.ut)) return true;
    }

    return false;
  }

  return true;
};

export const scoreLocationMatch = (
  job: FilteredJob,
  options: PipelineOptions
): number => {
  let score = 0;

  if (options.remoteFromIndia && job.location.scope === 'remote-india') {
    score += 25;
  }

  if (options.locations?.includes(job.location.locationId || '')) {
    score += 20;
  }

  if (job.location.locationId) {
    const jobLoc = searchLocations(job.location.locationId)[0];
    const matchedStates = options.locations?.filter((id) => {
      const loc = searchLocations(id)[0];
      return loc?.type === 'state' && loc.name === jobLoc?.state;
    }).length || 0;
    if (matchedStates > 0) score += 10;
  }

  if (job.location.scope === 'remote-global' && job.location.raw.toLowerCase().includes('india')) {
    score += 15;
  }

  if (job.location.scope === 'hybrid' && options.locations?.includes(job.location.locationId || '')) {
    score += 12;
  }

  return Math.min(score, 30);
};
