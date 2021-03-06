import { ref, reactive } from "vue";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";
import "firebase/messaging";
import CONFIG from "../config/";
import { useSettingsFirestore } from "./useSettingsFirestore"

const { getUserSettings, updateUserSettings } = useSettingsFirestore()
const firebaseConfig = {
    apiKey: CONFIG.FIREBASE_API_KEY,
    authDomain: `${CONFIG.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${CONFIG.FIREBASE_PROJECT_ID}.firebaseio.com`,
    projectId: CONFIG.FIREBASE_PROJECT_ID,
    storageBucket: `${CONFIG.FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: CONFIG.FIREBASE_SENDER_ID,
    measurementId: CONFIG.MEASUREMENT_ID,
    appId: CONFIG.FIREBASE_APP_ID,
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()

const onLoaded = ref(null)

export const setLoaded = (loadedCallback) => {
  onLoaded.value = loadedCallback   
}

export const firebaseState = reactive({
    user: null,
    uid: null,
    settings: {}
})

export const register = async (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password).catch(reason => {
        throw new Error(reason.message);
    })
}

export const login = async (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password).catch((reason) => {
        throw new Error(reason.message);
    })
}

export const loginWithProvider = async(providerName) => {
    firebase.auth().getRedirectResult().then(result => {
        firebaseState.user = result.user
    })

    firebase.auth().signInWithPopup(getProvider(providerName)).then(() => {
        location.reload()
    })
}

const getProvider = (providerName) => {
    const providers = {
        google: {
            method: new firebase.auth.GoogleAuthProvider,
            scopes: ['profile', 'email']
        }
    }
    const providerData = providers[providerName]
    if (providerData) {
        const provider = providerData.method;
        providerData.scopes.forEach(() => {
            provider.addScope('profile');
            provider.addScope('email');
        })
        return provider;
    }
}

export const logout = () => {
    return firebase.auth().signOut()
}

// Database
export const db = firebase.firestore();
export const updateSettings = (settings) => {
    return updateUserSettings({
        user_uid: firebaseState.user.uid,
        uid: firebaseState.user.uid,
        ...settings
    }).then(() => {
        firebaseState.settings =  Object.assign(firebaseState.settings || {}, settings)
    })

}

const initFirebase = new Promise(resolve => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const settings = await getUserSettings(user.uid)
            firebaseState.settings = settings;
            firebaseState.user = user;
            onLoaded.value && onLoaded.value()
        }
        resolve(user);
    })
})

export const firebaseInstance = firebase;

export const isAuthenticated = () => {
    return initFirebase;
}

