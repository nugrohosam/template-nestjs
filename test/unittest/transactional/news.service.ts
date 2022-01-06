import { Repository } from 'typeorm';
import { Propagation, Transactional } from 'typeorm-transactional-cls-hooked';
import { News } from './news.entity';

export class NewsService {
    constructor(readonly repository: Repository<News>) {}

    @Transactional()
    async createNews(topic: string, fail = false): Promise<News> {
        const news = new News();
        news.topic = topic;

        await this.repository.save(news);

        if (fail) {
            throw Error('fail = true, so failing on this nested service');
        }

        return news;
    }

    // Will ignore any current transactional
    @Transactional({ propagation: Propagation.NOT_SUPPORTED })
    async createNonTransactionalNews(
        topic: string,
        fail = false,
    ): Promise<News> {
        const news = new News();
        news.topic = topic;

        await this.repository.save(news);

        if (fail) {
            throw Error('fail = true, still successful on this nested service');
        }

        return news;
    }

    async getNewsByTopic(topic: string): Promise<News | undefined> {
        return this.repository.findOne({ topic });
    }
}
