import { createRoot } from 'react-dom/client';

import { RuntimeProvider } from './context';
import { Demo } from './Demo';

createRoot(document.getElementById('root')!).render(
  <>
        
      <div style={{width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <img id='img_id' style={{width: '50%', height: 'auto'}} src="https://i.ibb.co/jRqWzfM/50566334446-fbadd0ed3d-h.png" alt="50566334446-fbadd0ed3d-h"  />
      </div>
    <RuntimeProvider>
    <Demo />
  </RuntimeProvider>
  </>

);
