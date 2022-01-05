import { Repository } from 'typeorm';
import {
    runOnTransactionCommit,
    runOnTransactionRollback,
    Transactional,
} from 'typeorm-transactional-cls-hooked';
import { NewsService } from './news.service';
import { Post } from './post.entity';

export interface IGeneratePostAndNews {
    newsService: NewsService;
    message: string;
    failOnPost: boolean;
    failOnNews: boolean;
}

export class PostService {
    private _success = '';
    get success(): string {
        return this._success;
    }
    set success(value: string) {
        this._success = value;
    }

    constructor(readonly repository: Repository<Post>) {}

    @Transactional()
    async createPost(message: string, fail = false): Promise<Post> {
        const post = new Post();
        post.message = message;
        await this.repository.save(post);
        runOnTransactionCommit(() => (this.success = 'true'));
        runOnTransactionRollback(() => (this.success = 'false'));
        if (fail) {
            throw Error('fail = true, so failing');
        }
        return post;
    }

    @Transactional()
    async createPostAndNews(params: IGeneratePostAndNews): Promise<Post> {
        const post = new Post();
        post.message = params.message;

        await this.repository.save(post);

        runOnTransactionCommit(() => (this.success = 'true'));
        runOnTransactionRollback(() => (this.success = 'false'));

        if (params.failOnPost) {
            throw Error('fail = true, so failing');
        }

        await params.newsService.createNews(params.message, params.failOnNews);

        return post;
    }

    async getPostByMessage(message: string): Promise<Post | undefined> {
        return this.repository.findOne({ message });
    }
}
