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
    const variantsListWithStocks =
      await this.malfiniService.getProductAvailabilities();
    const variantsListWithPrices = await this.malfiniService.getProductPrices();
    const productVariations =
      await this.woocommerceService.getProductVariations(job.data.productId);

    const variantsWithUpdatedStocks = productVariations.map((variant) => {
      const variantWithQuantity = variantsListWithStocks.find(
        (stock) =>
          stock.productSizeCode === variant.sku &&
          new Date(stock.date).getTime() <= new Date().getTime(),
      );

      const updateVariantData: {
        id: string;
        stock_quantity: number;
        regular_price?: string;
      } = {
        id: variant.id,
        stock_quantity: 0,
      };

      if (variantWithQuantity) {
        updateVariantData.stock_quantity = variantWithQuantity.quantity;

        const variantWithPrice = variantsListWithPrices.find(
          (variant2) =>
            variant2.productSizeCode === variantWithQuantity.productSizeCode,
        );

        if (variantWithPrice) {
          updateVariantData.regular_price = (
            variantWithPrice.price * parseFloat(process.env.PRICE_MULTIPLIER)
          )
            .toFixed(2)
            .toString();
        }

        return updateVariantData;
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
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data?.productId,
      )}...`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job<StockUpdateJob>) {
    console.log(`done ${job.data.productId}`);
  }
}
