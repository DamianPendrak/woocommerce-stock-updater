import {
  OnQueueActive,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { WoocommerceService } from '../woocommerce/woocommerce.service';
import { MalfiniService } from '../malfini/malfini.service';
import { StockUpdateJob } from '../types/jobs';

@Processor('stock-update')
export class StockUpdateConsumer {
  constructor(
    private readonly woocommerceService: WoocommerceService,
    private readonly malfiniService: MalfiniService,
  ) {}

  @Process()
  async transcode(job: Job<StockUpdateJob>) {
    const attributesListWithStocks =
      await this.malfiniService.getProductAvailabilities();
    const productVariations =
      await this.woocommerceService.getProductVariations(job.data.productId);

    const variantsWithUpdatedStocks = productVariations.map((variant) => {
      const variantToUpdate = attributesListWithStocks.find(
        (stock) => stock.productSizeCode === variant.sku,
      );

      if (variantToUpdate) {
        return {
          id: variant.id,
          stock_quantity: variantToUpdate.quantity,
        };
      }

      return {
        id: variant.id,
        stock_quantity: 0,
      };
    });

    if (variantsWithUpdatedStocks && variantsWithUpdatedStocks.length > 0) {
      await this.woocommerceService.updateVariations(
        job.data.productId,
        variantsWithUpdatedStocks,
      );
    }

    return {};
  }

  @OnQueueActive()
  onActive(job: Job<StockUpdateJob>) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data?.productId}...`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job<StockUpdateJob>) {
    console.log(`done ${job.data.productId}`);
  }
}
