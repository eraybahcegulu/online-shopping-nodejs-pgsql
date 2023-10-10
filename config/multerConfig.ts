import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'build/src/uploads');
    },
    filename: function (req, file, cb) {
        const originalname = file.originalname;

        cb(null, Date.now() + '-' + originalname);
    }
});

const upload = multer({ storage: storage });

export { upload };
