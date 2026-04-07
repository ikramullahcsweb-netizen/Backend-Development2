import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose , {Schema} from "mongoose";


const videoSchema= new Schema({
  videoFile:{
    type: String,
    required:true
  },
  thumbnail:{
     type: String,
    required:true
  },
  title:{
     type: String,
    required:true
  },
  description:{
     type: String,
    required:true
  },
  duration:{
     type: Number,
    required:true
  },
  view:{
     type: Number,
    required:true
  },
  isPublished:{
     type: Boolean,
    required:true
  },
  owener:{
     type: Schema.Types.ObjectId,
     ref: "User"
  }
 
},
{timestamps})
video.Schema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)
