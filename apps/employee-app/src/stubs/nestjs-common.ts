// Browser stub for @nestjs/common — prevents validation.pipe.ts from crashing the browser bundle.
export class BadRequestException extends Error {}
export interface PipeTransform<T = unknown, R = unknown> {
  transform(value: T): R;
}
