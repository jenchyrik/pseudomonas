import { Controller, Get, Param, Res } from '@nestjs/common'
import { Response } from 'express'
import { TilesService } from './tiles.service'

@Controller('tiles')
export class TilesController {
  constructor(private readonly tilesService: TilesService) {}

  @Get('Khersonskaya/:z/:x/:y.png')
  async getTile(
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Res() res: Response,
  ) {
    const tile = await this.tilesService.getTile(z, x, y)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(tile)
  }
} 