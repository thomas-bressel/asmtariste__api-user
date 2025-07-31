import InterfaceRepository from '../repositories/interface.repository';
import InterfaceResponseDto from '../dtos/responses/interface-response.dto';
import PermissionResponseDto from '../dtos/permission.dto';

class InterfaceService {
    private interfaceRepository: InterfaceRepository;

    constructor(interfaceRepository: InterfaceRepository) {
        this.interfaceRepository = interfaceRepository;
    }

   /**
    * Get the default interface data by its type from the database collection
    * @param collectionType 
    * @param type 
    * @returns 
    */
    public async getDefaultInterfaceByType(collectionType: string, type: string): Promise<Record<string, any> | null> {
        const document = await this.interfaceRepository.getDefaultInterfaceByType(collectionType, type);
        if (!document) return null;
        const dto = new InterfaceResponseDto(document);
        return dto.getDataContent();
    }

    /**
     * Filter default interface with Permission code
     * @param userPermissions 
     * @param defaultInterface 
     * @returns 
     */
    public filterInterfaceByPermissions(userPermissions: PermissionResponseDto[], defaultInterface: Record<string, any>): Record<string, any> {
        const permissionCodes = this.extractPermissionCodes(userPermissions);
        const filteredNavigation = this.filterNavigation(permissionCodes, defaultInterface);
        return filteredNavigation;
    }

    /**
     * Extract permission code from the entire permission attributes
     * @param userPermissions 
     * @returns 
     */
    private extractPermissionCodes(userPermissions: PermissionResponseDto[]): string[] {
        return userPermissions.map(permission => permission.code);
    }

    /**
     * Get datas with filered permission
     * @param permissionCodes 
     * @param defaultInterface 
     * @returns 
     */
    private filterNavigation(permissionCodes: string[], navigationData: Record<string, any>): Record<string, any> {
        const filtered: Record<string, any> = {};

        Object.entries(navigationData).forEach(([sectionKey, sectionValue]) => {
            if (typeof sectionValue === 'object' && sectionValue !== null) {
                const filteredSection: Record<string, any> = {};

                Object.entries(sectionValue).forEach(([itemKey, itemValue]: [string, any]) => {
                    if (itemValue.permissionCode && permissionCodes.includes(itemValue.permissionCode)) {
                        const { permissionCode, ...itemWithoutPermission } = itemValue;
                        filteredSection[itemKey] = itemWithoutPermission;
                    }
                });

                if (Object.keys(filteredSection).length > 0) {
                    filtered[sectionKey] = filteredSection;
                }
            }
        });

        return filtered;
    }
   
}

export default InterfaceService;