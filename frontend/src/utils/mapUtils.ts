import { Point } from '../types/point';

export const getMapCenter = (points: Point[] = []): [number, number] => {
  if (points.length > 0) {
    // If there are points, center on the first point
    return [points[0].latitude, points[0].longitude];
  }
  // If no points, center on Rostov-on-Don
  return [47.2357, 39.7015];
}; 