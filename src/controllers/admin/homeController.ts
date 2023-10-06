import { Request, Response } from 'express';

class AdminHomeController {
  public viewAdminHome(req: Request, res: Response): void {
    if (!(req.session.userId && req.session.userType === 'admin')) {
      return res.redirect('/');
    }
    const user = {
      userId: req.session.userId,
      userName: req.session.userName,
      userEmail: req.session.userEmail
    };
    res.render('adminHome', { user });
  }
}

export default AdminHomeController;
