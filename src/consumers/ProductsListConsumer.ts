import { InjectQueue, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ProductsListJob, StockUpdateJob } from '../types/jobs';
import { WoocommerceService } from '../woocommerce/woocommerce.service';

@Processor('list-products')
export class ProductsListConsumer {
  constructor(
    @InjectQueue('list-products')
    private listProductsQueue: Queue<ProductsListJob>,
    @InjectQueue('stock-update')
    private stockUpdateQueue: Queue<StockUpdateJob>,
    private readonly woocommerceService: WoocommerceService,
  ) {}

  @Process()
  async transcode(job: Job<ProductsListJob>) {
    const products = await this.woocommerceService.getProducts(
      10,
      job.data.page,
    );

    if (products && products.length > 0) {
      await products.forEach((product) => {
        this.stockUpdateQueue.add({
          productId: product.id,
        });
      });

      await this.listProductsQueue.add({
        page: job.data.page + 1,
      });
    }

    return {};
  }

  @OnQueueActive()
  onActive(job: Job<ProductsListJob>) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
