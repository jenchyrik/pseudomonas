import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class TilesService {
  private readonly baseUrl = 'https://gis.antiplague.ru/tiles'

  async getTile(z: string, x: string, y: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/Khersonskaya/${z}/${x}/${y}.png`,
        {
          responseType: 'arraybuffer',
        },
      )
      return Buffer.from(response.data)
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
} 