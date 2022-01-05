import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { News } from './news.entity';

export class NewsService {
    constructor(readonly repository: Repository<News>) {}

    @Transactional()
    async createNews(topic: string, fail = false): Promise<News> {
        const news = new News();
        news.topic = topic;

        await this.repository.save(news);

        if (fail) {
            throw Error('fail = true, so failing on the nested service');
        }

        return news;
    }

    async getNewsByTopic(topic: string): Promise<News | undefined> {
        return this.repository.findOne({ topic });
    }
}
