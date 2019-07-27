import axios from 'react-native-axios';

const instance = axios.create({
    baseURL: 'http://192.168.0.21:5000'
});

export default instance;

