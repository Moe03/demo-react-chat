import { createRoot } from 'react-dom/client';

import { RuntimeProvider } from './context';
import { Demo } from './Demo';

createRoot(document.getElementById('root')!).render(
  <RuntimeProvider>
    <h1 className='text-sm'>Custom Skinned AI Chatbot Prototype</h1>
    <h1>Adani Group Real Estate</h1>
    <Demo />
  </RuntimeProvider>
);
