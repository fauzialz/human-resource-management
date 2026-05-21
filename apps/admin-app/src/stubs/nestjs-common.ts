// Browser stub for @nestjs/common — prevents validation.pipe.ts (re-exported by shared-types) from crashing the browser bundle. NestJS classes are never used client-side.
export class BadRequestException extends Error {}
export interface PipeTransform<T = unknown, R = unknown> {
  transform(value: T): R;
}
