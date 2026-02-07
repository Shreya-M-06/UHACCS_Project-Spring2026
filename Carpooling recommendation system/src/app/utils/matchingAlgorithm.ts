import { Trip, CarpoolMatch } from "../data/mockData";

/**
 * Calculate similarity between two destinations
 * Returns a score from 0 to 100
 */
function calculateDestinationSimilarity(dest1: string, dest2: string): number {
  const d1 = dest1.toLowerCase();
  const d2 = dest2.toLowerCase();
  
  // Exact match
  if (d1 === d2) return 100;
  
  // Check for common keywords
  const keywords1 = d1.split(/[\s,]+/);
  const keywords2 = d2.split(/[\s,]+/);
  
  const commonKeywords = keywords1.filter(k1 => 
    keywords2.some(k2 => k2.includes(k1) || k1.includes(k2))
  );
  
  const similarity = (commonKeywords.length / Math.max(keywords1.length, keywords2.length)) * 100;
  
  // Check if one destination might be on the way to another
  // Look for common street names, areas, or directions
  const onTheWay = keywords1.some(k1 => 
    keywords2.includes(k1) && (
      k1.includes('street') || 
      k1.includes('avenue') || 
      k1.includes('road') || 
      k1.includes('boulevard') ||
      k1.includes('downtown') ||
      k1.includes('center') ||
      k1.includes('plaza')
    )
  );
  
  return onTheWay ? Math.max(similarity, 60) : similarity;
}

/**
 * Calculate time proximity
 * Returns a score from 0 to 100
 */
function calculateTimeSimilarity(time1: string, time2: string): number {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  const diffMinutes = Math.abs(totalMinutes1 - totalMinutes2);
  
  // If within 15 minutes, high score
  if (diffMinutes <= 15) return 100;
  // If within 30 minutes, good score
  if (diffMinutes <= 30) return 80;
  // If within 60 minutes, moderate score
  if (diffMinutes <= 60) return 60;
  // If within 2 hours, low score
  if (diffMinutes <= 120) return 40;
  
  return Math.max(0, 40 - (diffMinutes - 120) / 10);
}

/**
 * Calculate date similarity
 * Returns a score from 0 to 100
 */
function calculateDateSimilarity(date1: string, date2: string): number {
  if (date1 === date2) return 100;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const diffDays = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 100;
  if (diffDays <= 1) return 50;
  if (diffDays <= 3) return 30;
  
  return Math.max(0, 30 - diffDays * 5);
}

/**
 * Generate a reason for the match
 */
function generateMatchReason(
  destinationScore: number,
  timeScore: number,
  dateScore: number,
  trip1: Trip,
  trip2: Trip
): string {
  const reasons: string[] = [];
  
  if (dateScore < 100) {
    return "Different travel dates";
  }
  
  if (destinationScore >= 80) {
    reasons.push("Very similar destinations");
  } else if (destinationScore >= 60) {
    reasons.push("Destination is on the way");
  } else if (destinationScore >= 40) {
    reasons.push("Nearby destinations");
  }
  
  if (timeScore >= 80) {
    reasons.push("Similar arrival times");
  } else if (timeScore >= 60) {
    reasons.push("Arrival times within 30 minutes");
  }
  
  if (reasons.length === 0) {
    return "Potential carpool match";
  }
  
  return reasons.join(" • ");
}

/**
 * Find carpool matches for a given trip
 */
export function findCarpoolMatches(
  userTrip: Trip,
  allTrips: Trip[]
): CarpoolMatch[] {
  const matches: CarpoolMatch[] = [];
  
  for (const trip of allTrips) {
    // Don't match with own trip
    if (trip.userId === userTrip.userId) continue;
    
    const destinationScore = calculateDestinationSimilarity(
      userTrip.destination,
      trip.destination
    );
    
    const timeScore = calculateTimeSimilarity(
      userTrip.arrivalTime,
      trip.arrivalTime
    );
    
    const dateScore = calculateDateSimilarity(
      userTrip.date,
      trip.date
    );
    
    // Calculate overall match score
    // Date is most important (50%), then destination (30%), then time (20%)
    const matchScore = (
      dateScore * 0.5 +
      destinationScore * 0.3 +
      timeScore * 0.2
    );
    
    const reason = generateMatchReason(
      destinationScore,
      timeScore,
      dateScore,
      userTrip,
      trip
    );
    
    // Only include matches with score above 40
    if (matchScore >= 40) {
      matches.push({
        trip,
        matchScore: Math.round(matchScore),
        reason,
      });
    }
  }
  
  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches;
}
