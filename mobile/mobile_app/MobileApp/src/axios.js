import axios from 'react-native-axios';

const instance = axios.create({
    baseURL: 'http://192.168.0.151:5000'
});

export default instance;

