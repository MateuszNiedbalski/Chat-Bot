import { Schema, model, models} from 'mongoose';
import { Uncial_Antiqua } from 'next/font/google';

const UserSchema = new Schema({
    email: {
        type: String,
        unique: [true, 'Email already Exists'],
        required: [true, 'Email required']

    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    image:{
        type: String,
    }
})

const User = models.User || model('User', UserSchema);

export default User;