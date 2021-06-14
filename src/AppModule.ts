import { Module } from '@nestjs/common';
import { RavenModule } from 'nest-raven';

@Module({
    imports: [RavenModule],
    providers: [],
})
export class AppModule {}
