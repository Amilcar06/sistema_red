import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import productService from '../services/product.service';
import { catchAsync } from '../utils/helpers';

class ProductController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: product,
    });
  });

  findAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await productService.findAll(req.query);
    res.json({
      status: 'success',
      ...result,
    });
  });

  findById = catchAsync(async (req: AuthRequest, res: Response) => {
    const product = await productService.findById(req.params.id);
    res.json({
      status: 'success',
      data: product,
    });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: product,
    });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await productService.delete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

  getCategories = catchAsync(async (req: AuthRequest, res: Response) => {
    const categories = await productService.getCategories();
    res.json({
      status: 'success',
      data: categories,
    });
  });
}

export default new ProductController();

