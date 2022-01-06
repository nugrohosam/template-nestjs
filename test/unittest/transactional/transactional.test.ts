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
import { IGeneratePostAndNews, PostService } from './post.service';

function takeDelay(milisecond: number): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, milisecond);
    });
}

beforeAll(async () => {
    initializeTransactionalContext();
    patchTypeORMRepositoryWithBaseRepository();
    await createConnection({
        type: 'mysql',
        host: config.databaseTest.host,
        port: +config.databaseTest.port,
        username: config.databaseTest.username,
        password: config.databaseTest.password,
        database: config.databaseTest.database,
        entities: [Post, News],
        synchronize: true,
        logging: 'all',
    });
});

afterAll(async () => {
    const repositoryPost = getConnection().getRepository(Post);
    const repositoryNews = getConnection().getRepository(News);
    await repositoryPost.clear();
    await repositoryNews.clear();
    await getConnection().close();
});

describe('@Transactional() test', () => {
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
        const dbPost = await servicePost.getPostByMessage(param.message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeTruthy();
    });

    it('Fails at News when creating a Post and News using service', async () => {
        const repositoryPost = getConnection().getRepository(Post);
        const repositoryNews = getConnection().getRepository(News);
        const servicePost = new PostService(repositoryPost);
        const serviceNews = new NewsService(repositoryNews);

        const param: IGeneratePostAndNews = {
            newsService: serviceNews,
            message: 'PostNews Fail on News',
            failOnPost: false,
            failOnNews: true,
        };
        expect(servicePost.createPostAndNews(param)).rejects.toThrow();

        await takeDelay(100);

        expect(servicePost.success).toEqual('false');
        const dbPost = await servicePost.getPostByMessage(param.message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeFalsy();

        const dbNews = await serviceNews.getNewsByTopic(param.message);
        console.log(`dbNews: ${dbNews}`);
        expect(dbNews).toBeFalsy();
    });
});

describe('@Transactional({ propagation: Propagation.NOT_SUPPORTED }) test', () => {
    it('Create a Post and News', async () => {
        const repositoryPost = getConnection().getRepository(Post);
        const repositoryNews = getConnection().getRepository(News);
        const servicePost = new PostService(repositoryPost);
        const serviceNews = new NewsService(repositoryNews);

        const param: IGeneratePostAndNews = {
            newsService: serviceNews,
            message:
                'Propagation.NOT_SUPPORTED => Post and News both are successful.',
            failOnPost: false,
            failOnNews: false,
        };
        const post = await servicePost.createPostAndNonTransactionalNews(param);
        expect(post.id).toBeGreaterThan(0);

        await takeDelay(100);

        expect(servicePost.success).toEqual('true');
        const dbPost = await servicePost.getPostByMessage(param.message);
        console.log(`dbPost: ${dbPost}`);
        expect(dbPost).toBeTruthy();

        const dbNews = await serviceNews.getNewsByTopic(param.message);
        console.log(`dbNews: ${dbNews}`);
        expect(dbNews).toBeTruthy();
    });

    it('Fails at Post then not failing on News (still created)', async () => {
        const repositoryPost = getConnection().getRepository(Post);
        const repositoryNews = getConnection().getRepository(News);
        const servicePost = new PostService(repositoryPost);
        const serviceNews = new NewsService(repositoryNews);

        const param: IGeneratePostAndNews = {
            newsService: serviceNews,
            message:
                'Propagation.NOT_SUPPORTED => PostNews Fail on Post still created on News',
            failOnPost: false,
            failOnNews: true,
        };
        expect(
            servicePost.createPostAndNonTransactionalNews(param),
        ).rejects.toThrow();

        await takeDelay(100);

        expect(servicePost.success).toEqual('false');
        const dbNews = await serviceNews.getNewsByTopic(param.message);
        console.log(`dbNews: ${dbNews}`);
        expect(dbNews).toBeTruthy();
    });
});
