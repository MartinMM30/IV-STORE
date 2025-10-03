import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAmg8oKTfIT56_F7yELRZAoyZMq-MqRl6E',
  authDomain: 'iv-design-c13bc.firebaseapp.com',
  projectId: 'iv-design-c13bc',
  storageBucket: 'iv-design-c13bc.appspot.com',
  messagingSenderId: '654972044837',
  appId: '1:654972044837:web:fe6725365c57374cd8e1cc',
  measurementId: 'G-1HXR7VR9LV',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined') {
  // Solo intenta cargar analytics si estamos en el navegador
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, analytics };
