import mongoose, { Schema } from 'mongoose'
import bcrypt, { hash } from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    fullName : {
        type :String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String, // url
        required : true
    },
    coverImage :{
        type : String
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "video"
        }
    ],
    password :  {
        type : String,
        required : [true, 'Password is Required']
    },
    refrashToken : {
        type : String
    }
},
{
    timestamps : true
}
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next();
});

userSchema.methods.isPasswordMatched( async function  (password) {
    return await bcrypt.compare(password, this.password)
});

userSchema.methods.genrateAccessToken( function(){
    return jwt.sign(
        {
            _id:this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
})

userSchema.methods.genrateRefreshToken( function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
})

export const User = mongoose.model("User", userSchema)