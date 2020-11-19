import { URLService } from '@/services/URLService';
import packageJson from '../../package.json';

describe('URLService', () => {
  it('creates a serverURL from package.json homepage when env is production', () => {
    const urlService = new URLService('production');
    expect(urlService.server).toEqual(packageJson.homepage);
  });

  it('creates a serverURL as localhost:3000 homepage when env is development', () => {
    const urlService = new URLService('development');
    expect(urlService.server).toEqual('http://localhost:3000');
  });
});
