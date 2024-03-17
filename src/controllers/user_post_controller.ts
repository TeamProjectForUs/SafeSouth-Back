import StudentPost, { IPost } from "../models/user_post_model";
import { BaseController } from "./base_controller";
import { Response,Request } from "express";
import { AuthResquest } from "../common/auth_middleware";
import user_model from "../models/user_model";

class StudentPostController extends BaseController<IPost> {
    constructor() {
        super(StudentPost)
    }
    
    async get(req: Request, res: Response) {
        try {
            if (req.query.name) {
                const posts = await this.model.find({ name: req.query.name }).populate("owner");
                res.send(posts);
            } else {
                const posts = await this.model.find().populate("owner");;
                res.send(posts);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async post(req: AuthResquest, res: Response) {
        const _id = req.user._id;
        req.body.owner = _id;
        try {
            let post = await this.model.create(req.body);
            post = await post.populate("owner")
            await user_model.findByIdAndUpdate({$push: {  posts: post._id}})
            res.status(201).send(post);
        } catch (err) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const post = await this.model.findById(req.params.id).populate("owner");
            res.send(post);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }


    async deleteById(req: AuthResquest, res: Response) {
        try {
            const post_ = await this.model.findById(req.params.id);
            if(post_.owner.toString() !== req.user._id.toString()) {
                return res.status(401).json("Unauthorized")
            }
            const post = await this.model.findByIdAndDelete(req.params.id);
            await user_model.findByIdAndUpdate(req.user._id, {$pull: {  posts: req.params.id}})
            res.status(201).send(post);
        } catch (err) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }
    
    async putById(req: AuthResquest, res: Response) {
        try {
            const post = await this.model.findByIdAndUpdate(req.params.id, req.body, {returnOriginal:false});
            res.status(201).send(post);
        } catch (err) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }
}

export default new StudentPostController();
