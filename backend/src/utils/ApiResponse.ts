export class ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];

  constructor(success: boolean, message?: string, data?: T, errors?: any[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success<T>(data: T, message?: string) {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string, errors?: any[]) {
    return new ApiResponse<null>(false, message, undefined, errors);
  }
}
