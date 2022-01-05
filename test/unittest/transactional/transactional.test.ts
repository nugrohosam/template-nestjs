/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import 'reflect-metadata';
import { config } from 'src/config';

import { createConnection, getConnection } from 'typeorm';
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { News } from './news.entity';
import { NewsService } from './news.service';
import { Post } from './post.entity';
import { IGeneratePostAndNews, PostService } from './simple.service';

function takeDelay(milisecond: number): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, milisecond);
    });
}

describe('@Transactional() test', () => {
    beforeAll(async () => {
        initializeTransactionalContext();
        patchTypeORMRepositoryWithBaseRepository();
        await createConnection({
            type: 'mysql',
            host: config.database.host,
            port: +config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.databaseTest,
            entities: [Post, News],
            synchronize: true,
            logging: 'all',
        });
    });

    afterAll(async () => await getConnection().close());

    it('Creates a post using service', async () => {
        const repository = getConnection().getRepository(Post);
        const service = new PostService(repository);
        const message = 'simple - A successful post';
        const post = await service.createPost(message);

        await takeDelay(100);

        expect(post.id).toBeGreaterThan(0);
        expect(service.success).toEqual('true');
        const dbPost = await service.getPostByMessage(message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeTruthy();
    });

    it('Fails creating a post using service', async () => {
        const repository = getConnection().getRepository(Post);
        const service = new PostService(repository);
        const message = 'simple - An unsuccessful post';
        expect(service.createPost(message, true)).rejects.toThrow();

        await takeDelay(100);

        expect(service.success).toEqual('false');
        const dbPost = await service.getPostByMessage(message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeFalsy();
    });

    it('Create a Post and News using service', async () => {
        const repositoryPost = getConnection().getRepository(Post);
        const repositoryNews = getConnection().getRepository(News);
        const servicePost = new PostService(repositoryPost);
        const serviceNews = new NewsService(repositoryNews);
        const message = 'simple - An unsuccessful post';

        const param: IGeneratePostAndNews = {
            newsService: serviceNews,
            message: 'Post and News both are successful.',
            failOnPost: false,
            failOnNews: false,
        };
        const post = await servicePost.createPostAndNews(param);
        expect(post.id).toBeGreaterThan(0);

        await takeDelay(100);

        expect(servicePost.success).toEqual('true');
        const dbPost = await servicePost.getPostByMessage(message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeFalsy();
    });

    it('Fails at News when creating a Post and News using service', async () => {
        const repositoryPost = getConnection().getRepository(Post);
        const repositoryNews = getConnection().getRepository(News);
        const servicePost = new PostService(repositoryPost);
        const serviceNews = new NewsService(repositoryNews);
        const message = 'simple - An unsuccessful post';

        const param: IGeneratePostAndNews = {
            newsService: serviceNews,
            message: 'PostNews Fail on News',
            failOnPost: false,
            failOnNews: true,
        };
        expect(servicePost.createPostAndNews(param)).rejects.toThrow();

        await takeDelay(100);

        expect(servicePost.success).toEqual('false');
        const dbPost = await servicePost.getPostByMessage(message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeFalsy();
    });
});
