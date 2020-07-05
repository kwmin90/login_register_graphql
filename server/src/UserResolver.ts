import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/User";
import { sign, verify } from 'jsonwebtoken';
import * as fs from 'fs';
import { Request } from 'express';

const RSA_PRIVATE_KEY = fs.readFileSync('./private.key');
const RSA_PUBLIC_KEY = fs.readFileSync('./public.key');

@ObjectType()
class LoginResponse {
  @Field()
  idToken?: string;
  @Field(()=> User)
  user: User;
}

@Resolver()
export class UserResolver {

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(()=> User, { nullable: true})
  async findUser(
    @Ctx() req: Request
    ){
    const authorization = req.header('Authorization');

    if (!authorization) throw new Error("Not authorized");

    try{
        const token = authorization.split(" ")[1];
        const payload: any = verify(token, RSA_PUBLIC_KEY);
        return await User.findOne(payload.userId);
    }catch(err){
        console.log(err);
        return null;
    }
  }
  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }

  @Mutation(()=> LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<LoginResponse>{
    const user = await User.findOne({where: { email }});

    if(!user) throw new Error("Could not find user");
    const valid = await compare(password, user.password);
    if(!valid) throw new Error("Wrong password");

    const jwtBearerToken = sign({userId: user.id}, RSA_PRIVATE_KEY,{
      algorithm: 'RS256',
      expiresIn: '15m'
    });

    return {
      idToken: jwtBearerToken,
      user
    }
  }
}