import { Request, Response } from 'express';
import ProductModel from '../../models/admin/productModel';

class ProductController {

    private productModel: ProductModel;

    constructor() {
      this.productModel = new ProductModel();
    }

    public async viewAdminProducts(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
        try {
          const urlAdminId = req.query.admin;
          const products = await this.productModel.getAdminProducts();
    
          res.render('editProducts', { products, urlAdminId });
        } catch (error) {
          console.error('Error fetching product details:', error);
          res.status(500).send('Internal Server Error');
        }
      }


      public async renderProductAddPage(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
        try {
          const productTypes = await this.productModel.getAllProductTypes();
          const products = await this.productModel.getAdminProducts();
    
          res.render('addProduct', { productTypes, products });
        } catch (error) {
          console.error('Error fetching product types:', error);
          res.status(500).send('Internal Server Error');
        }
      }

      public async addProduct(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
    
        const { type, name, price, quantity, description } = req.body;
    
        try {
          const newProduct = await this.productModel.addProduct(type, name, price, quantity, description);
    
          res.json({ newProduct });
        } catch (error: any) {
          if (error.code === '22P02') {
            res.json({ error: 'Enter number for price.' });
          } 
          else if (error.code ==="22003")
          {
            res.json({ error: 'The entered price is too high.' });
          }
          else {
            console.error('error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        }
      }

      public async renderProductUpdatePage(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
    
        const productId = req.params.id;
        const urlAdminId = req.query.admin;
    
        try {
          const product = await this.productModel.getProductById(productId);
          const productTypes = await this.productModel.getAllProductTypes();
    
          if (product) {
            res.render('updateProduct', { productId, product, urlAdminId, productTypes });
          } else {
            res.status(404).json({ message: 'Product not found' });
          }
        } catch (error) {
          console.error('Error retrieving product for update:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }

      public async updateProduct(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
    
        const productId = req.params.id;
        const { name, productType, price, quantity, description } = req.body;
    
        try {
          const updatedProduct = await this.productModel.updateProduct(productId, name, productType, price, quantity, description);
    
          if (updatedProduct) {
            res.json({ message: 'Product updated successfully', updatedProduct });
          } else {
            res.status(404).json({ message: 'Product not found' });
          }
        } catch (error: any) {
          if (error.code === '22P02') {
            res.json({ error: 'Enter number for price' });
          } 
          else if (error.code ==="22003")
          {
            res.json({ error: 'The entered price is too high' });
          }
          else {
            console.error('error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        }
      }

      public async deleteProduct(req: Request, res: Response): Promise<void> {
        if (!(req.session.userId && req.session.userType === 'admin')) {
          return res.redirect('/');
        }
        const productId = req.params.id;
    
        try {
          const deletedProduct = await this.productModel.deleteProduct(productId);
    
          if (deletedProduct) {
            res.json({ message: 'Product deleted successfully' });
          } else {
            res.status(404).json({ message: 'Product not found' });
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }
}

export default ProductController;
