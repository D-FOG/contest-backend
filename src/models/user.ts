// src/models/Admin.ts
import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  username: string;
  password: string; 
  email: string;
  role: "admin" | "user" | undefined;
  comparePassword: (candidatePassword: string, callback: (err: any, isMatch: boolean) => void) => void;
}

const adminSchema = new mongoose.Schema<IAdmin>({
    username: { type: mongoose.Schema.Types.String, required: true, unique: true },
    password: { type: mongoose.Schema.Types.String, required: true },
    email: { type: mongoose.Schema.Types.String, required: true },
    role: { type: mongoose.Schema.Types.String, default: 'admin'}
}, { timestamps: true })

adminSchema.pre("save", function (next) {
    const admin = this;
    if (!admin.isModified("password")) return next();
    if (admin.isModified("password")){
        bcrypt.genSalt(10, function (err,  salt) {
            if (err) return next(err);

            //hash password
            const hash = bcrypt.hash(admin.password, salt, function (err, hash){
                if (err) return next(err);
                admin.password = hash;
                next();
            });
            
        });
    }
});

adminSchema.methods.comparePassword = function (candidatePassword: string, callback: (err: any, isMatch: boolean) => void) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return callback(err, false);
      callback(null, isMatch);
    });
  };

// adminSchema.methods.comparePassword = function (
//     candidatePassword : string,
//     cd: (arg: any, isMatch?: boolean) => void
// ){
//     bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
//         if (err) return cd(err);
//         cd(null, isMatch);
//     });
// };

// const AdminSchema: Schema<IAdmin> = new Schema({
//   username: { type: Schema.Types.String, required: true, unique: true },
//   password: { type: Schema.Types.String, required: true },
//   email: { type: Schema.Types.String, required: true },
//   { timestamps: true }

// });

//const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

// type Admin = InferSchemaType<typeof adminSchema>;
// export default model<Admin>("Admin", adminSchema);
const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin