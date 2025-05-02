import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  public throwError(message: string, error: unknown): never {
    throw new Error(this.getErrorMessage(message, error));
  }

  public getErrorMessage(message: string, error: unknown): string {
    console.error(message, error);
    let errorMessage = error;

    if (error instanceof Error || error instanceof HttpErrorResponse) {
      errorMessage = error.message;
    } else if (error instanceof HttpErrorResponse) {
      errorMessage = error.message;
    }

    return `${message} Error: ${errorMessage}`;
  }
}
