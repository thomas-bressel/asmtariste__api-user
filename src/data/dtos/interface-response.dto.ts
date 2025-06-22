class InterfaceResponseDto {
    public data: Record<string, any>;

    constructor(document: any) {
        this.data = document.data || {};
    }

    /**
     * Convert raw datas into a new object with content of the key 'data'
     * @returns 
     */
    public getDataContent(): Record<string, any> {
        return this.data;
    }
}

export default InterfaceResponseDto;