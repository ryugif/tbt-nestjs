import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.switchToHttp().getResponse();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next.handle().pipe(
      map((data) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        status: response.statusCode === 200 || response.statusCode === 201,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
      })),
    );
  }
}
