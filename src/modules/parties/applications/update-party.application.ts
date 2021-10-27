import { Injectable, Logger } from '@nestjs/common';
import { PartyModel } from 'src/models/party.model';
import { UpdatePartyRequest } from '../requests/update-party.request';
import fs from 'fs';
import { config } from 'src/config';
import { Repository } from 'typeorm';
import { PartyService } from '../services/party.service';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserService } from 'src/modules/users/services/get-user.service';

@Injectable()
export class UpdatePartyApplication {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        private readonly getUserService: GetUserService,
        private readonly partyService: PartyService,
        private readonly web3Service: Web3Service,
    ) {}

    async call(
        party: PartyModel,
        request: UpdatePartyRequest,
    ): Promise<PartyModel> {
        const owner = await this.getUserService.getUserById(party.ownerId);
        await this.web3Service.validateSignature(
            request.signature,
            owner.address,
            this.partyService.generateUpdatePartySignatureMessage(party.id),
        );

        if (request.imageUrl) {
            if (party.imageUrl) {
                fs.unlink(`${config.storage.path}/${party.imageUrl}`, (err) =>
                    Logger.error(err),
                );
            }

            party.imageUrl = request.imageUrl;
        }

        if (request.bio) {
            party.bio = request.bio;
        }

        return await this.partyRepository.save(party);
    }
}
