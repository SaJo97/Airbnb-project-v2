declare namespace NodeJS { // extends ts built in type def for process.env with use of NodeJS - gives autocomplete
  interface ProcessEnv {
    PORT?: number;
    MONGO_URI?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    ACCESS_TOKEN_SECRET?: string;
  }
}
