import { Request, Response } from 'express';
import ProductTypeModel from '../../models/admin/addProductTypeModel';

class ProductTypeController {
  private productTypeModel: ProductTypeModel;

  constructor() {
    this.productTypeModel = new ProductTypeModel;
  }

  public async renderProductTypeAddPage(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    try {
      const productTypes = await this.productTypeModel.getAllProductTypes();
      res.render('addProductType', { productTypes });
    } catch (error) {
      console.error('Error fetching product types:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public async addProductType(req: Request, res: Response): Promise<void> {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }

    const { type } = req.body;

    try {
      await this.productTypeModel.addProductType(type);
      res.json({ newProductType: type });
    } catch (error) {
      console.error('Error adding product type:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export default ProductTypeController;
