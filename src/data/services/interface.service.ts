import InterfaceRepository from '../repositories/interface.repository';
import InterfaceResponseDto from '../dtos/interface-response.dto';

class InterfaceService {
    private interfaceRepository: InterfaceRepository;

    constructor(interfaceRepository: InterfaceRepository) {
        this.interfaceRepository = interfaceRepository;
    }

    /**
     * Get interface data by name from collection
     */
    public async getDefaultInterfaceByType(collectionType: string, type: string): Promise<Record<string, any> | null> {
            const document = await this.interfaceRepository.getDefaultInterfaceByType(collectionType, type);
            
            if (!document) return null;

            const dto = new InterfaceResponseDto(document);
            return dto.getDataContent();
    }
}

export default InterfaceService;