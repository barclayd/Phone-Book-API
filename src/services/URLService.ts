import packageJson from '../../package.json';

export class URLService {
  constructor(private env = process.env.NODE_ENV || 'development') {}

  public server =
    this.env === 'production' ? packageJson.homepage : 'http://localhost:3000';

  public webApp = process.env.WEB_URL;
}
