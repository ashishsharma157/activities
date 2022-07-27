export interface Pagination{
    CurrentPage:number;
    itemsPerPage:number;
    totalItems:number;
    totalPages:number;
}

export class PaginatedResult<T>{
    data:T;
    pagination:Pagination;

    constructor(data: T, pagination:Pagination)
    {
        this.data=data;
        this.pagination=pagination;
    }
}

export class PagingParams{
    pagenumber;
    PageSize;
    
    constructor(pageNumber=1, pageSize=2)
    {
        this.pagenumber=pageNumber;
        this.PageSize=pageSize;
    }
}