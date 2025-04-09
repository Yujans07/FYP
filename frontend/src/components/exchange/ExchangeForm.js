import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAlert } from 'react-alert';
import { createExchangeRequest, clearErrors } from '../../actions/exchangeActions';

const ExchangeForm = ({ product, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('Good');
    const [originalPurchaseDate, setOriginalPurchaseDate] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [additionalPayment, setAdditionalPayment] = useState(0);

    const alert = useAlert();
    const dispatch = useDispatch();

    const { loading, error, success } = useSelector(state => state.exchange);

    useEffect(() => {
        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }

        if (success) {
            alert.success('Exchange request submitted successfully');
            setName('');
            setDescription('');
            setCondition('Good');
            setOriginalPurchaseDate('');
            setImages([]);
            setImagesPreview([]);
            setAdditionalPayment(0);
            onClose();
        }
    }, [dispatch, alert, error, success, onClose]);

    const onChange = e => {
        const files = Array.from(e.target.files);

        setImagesPreview([]);
        setImages([]);

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result]);
                    setImages(oldArray => [...oldArray, reader.result]);
                }
            }

            reader.readAsDataURL(file);
        })
    }

    const submitHandler = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert.error('Please enter your phone model');
            return;
        }

        if (!description.trim()) {
            alert.error('Please enter phone description');
            return;
        }

        if (!originalPurchaseDate) {
            alert.error('Please select original purchase date');
            return;
        }

        if (images.length === 0) {
            alert.error('Please upload at least one image');
            return;
        }

        const formData = {
            desiredProductId: product._id,
            exchangeProduct: {
                name: name.trim(),
                description: description.trim(),
                condition,
                originalPurchaseDate
            },
            images,
            additionalPayment: Number(additionalPayment)
        }

        dispatch(createExchangeRequest(formData));
    }

    return (
        <div className="exchange-form-container">
            <div className="modal-content">
                <h2>Exchange Request for {product.name}</h2>
                <form className="form-container" onSubmit={submitHandler}>
                    <div className="form-group">
                        <label htmlFor="name">Your Phone Model</label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Phone Description</label>
                        <textarea
                            id="description"
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="condition">Condition</label>
                        <select
                            id="condition"
                            className="form-control"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="purchaseDate">Original Purchase Date</label>
                        <input
                            type="date"
                            id="purchaseDate"
                            className="form-control"
                            value={originalPurchaseDate}
                            onChange={(e) => setOriginalPurchaseDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="additionalPayment">Additional Payment (if any)</label>
                        <input
                            type="number"
                            id="additionalPayment"
                            className="form-control"
                            value={additionalPayment}
                            onChange={(e) => setAdditionalPayment(e.target.value)}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Images</label>
                        <div className="custom-file">
                            <input
                                type="file"
                                name="product_images"
                                className="custom-file-input"
                                id="customFile"
                                onChange={onChange}
                                accept="image/*"
                                multiple
                                required
                            />
                            <label className="custom-file-label" htmlFor="customFile">
                                Choose Images
                            </label>
                        </div>

                        <div className="images-preview">
                            {imagesPreview.map(img => (
                                <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block py-3"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Exchange Request'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ExchangeForm; 