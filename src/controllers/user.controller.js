import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken=async(userId)=> {
  try{
    const user =await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}



  }
  catch(error){
        throw new ApiError( 501,"something went wrong while generate refresh and accessToken")

  }
}

const registerUser = asyncHandler(async (req, res) => {

  console.log("CONTROLLER REACHED");
  const { fullName, password, username, email } = req.body;
  console.log("email :", email)
  console.log("username :",username)

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all field is requried");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user and email are already exist ");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const coverImageLocalPath = (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) 
    ? req.files.coverImage[0].path 
    : "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username,
    email,
  });

  const createdUser = await User
    .findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));

});

const loginUser= asyncHandler(async(req,res)=>{
  const {email,username,password}= req.body
  if(!(username ,email)){
    throw new ApiError(400,"email or username is required")
  }
  const user= await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"user doesnot exist")
  }
  const isPasswordValid=await user.isPasswordValid(password)

  if(!isPasswordValid){
    throw new ApiError( 401,"invalid user credendials")
  }
  const {accessToken ,refreshToken}=await generateAccessAndRefreshToken(user._id)
  const loggedInUser=await User.findById(user._id)
  .select("-password -refreshToken")
  const options={
    httpOnly: true,
    secure: true
  }
return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,refreshToken
    },
    "user loggedIn successfully"
  )
)



})
const logoutUser= asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },    
      {
        new: true
      } 
  )
  const options={
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200, {}, "user logged out"))


})
const refreshAccessToken =asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }
  try {
    const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user=await User.findById(decodedToken._id)
    if(incomingRefreshToken !==user?.refreshToken){
      throw new ApiError(401,"RefreshToken is expired or used")
    }
    const options={
      httpOnly: true,
      secure: true
    }
    const {accessToken, newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json (new ApiResponse(200,
      {accessToken,refreshToken: newRefreshToken},
      "access token refreshed"
    )
  )
    
  } catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
    
  }

})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken

 };
