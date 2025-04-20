import { Types } from 'mongoose';

export interface PaginationResult<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: 'next' | 'previous';
}

export class PaginationService {
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  static encodeCursor(date: Date, id: Types.ObjectId): string {
    // Combine date and ID to ensure uniqueness
    const cursor = `${date.getTime()}_${id.toString()}`;
    return Buffer.from(cursor).toString('base64');
  }

  static decodeCursor(cursor: string): { date: Date; id: Types.ObjectId } {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timestamp, id] = decoded.split('_');
    
    return {
      date: new Date(parseInt(timestamp)),
      id: new Types.ObjectId(id)
    };
  }

  static createPaginationQuery(options: PaginationOptions) {
    const limit = Math.min(options.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
    
    if (!options.cursor) {
      return {
        query: {},
        limit: limit + 1, // Get one extra to check if there's a next page
        sort: { createdAt: -1, _id: -1 }
      };
    }

    const { date, id } = this.decodeCursor(options.cursor);
    const isForward = options.direction !== 'previous';

    const query = isForward
      ? {
          $or: [
            { createdAt: { $lt: date } },
            {
              createdAt: date,
              _id: { $lt: id }
            }
          ]
        }
      : {
          $or: [
            { createdAt: { $gt: date } },
            {
              createdAt: date,
              _id: { $gt: id }
            }
          ]
        };

    return {
      query,
      limit: limit + 1, // Get one extra to check if there's a next/previous page
      sort: isForward 
        ? { createdAt: -1, _id: -1 }
        : { createdAt: 1, _id: 1 }
    };
  }

  static async createPaginatedResponse<T extends { _id: Types.ObjectId; createdAt: Date }>(
    items: T[],
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const limit = Math.min(options.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const hasMore = items.length > limit;
    
    // Remove the extra item we used to check for more pages
    const paginatedItems = hasMore ? items.slice(0, limit) : items;
    
    // If we're paginating backwards, reverse the items to maintain correct order
    const finalItems = options.direction === 'previous' 
      ? paginatedItems.reverse() 
      : paginatedItems;

    const firstItem = finalItems[0];
    const lastItem = finalItems[finalItems.length - 1];

    return {
      items: finalItems,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: !!options.cursor,
        nextCursor: lastItem ? this.encodeCursor(lastItem.createdAt, lastItem._id) : null,
        previousCursor: firstItem ? this.encodeCursor(firstItem.createdAt, firstItem._id) : null
      }
    };
  }
} 