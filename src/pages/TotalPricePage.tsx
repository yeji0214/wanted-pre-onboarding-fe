import React, { useEffect, useState, useRef, useCallback } from "react";
import { getMockData } from '../data/MockData.ts';

interface MockData {
    productId: string;
    productName: string;
    price: number;
    boughtDate: string;
}

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<MockData[]>([]);
    const [pageNum, setPageNum] = useState(0);
    const [isEnd, setIsEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // 가격 합계 계산
    const calculateTotalPrice = () => {
        return products.reduce((acc, product) => acc + product.price, 0);
    };

    // 데이터 불러오기 함수
    const loadMoreData = async () => {
        if (loading || isEnd) return;
        setLoading(true);
        const { datas, isEnd: newIsEnd } = await getMockData(pageNum);
        setProducts((prevProducts) => [...prevProducts, ...datas]);
        setIsEnd(newIsEnd);
        setLoading(false);
        setPageNum((prevPageNum) => prevPageNum + 1);
    };

    // Intersection Observer를 이용해 스크롤이 트리거 요소에 닿을 때마다 데이터 로드
    const observeLoadMoreTrigger = useCallback(
        (node: HTMLDivElement) => {
            if (loading || isEnd) return;

            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreData();
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [loading, isEnd]
    );

    // useEffect(() => {
    //     loadMoreData(); // 첫 데이터 로드
    // }, []);

    return (
        <div>
            <h1>Product List</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.productId}>
                        {product.productName} - ${product.price} (구매 날짜:{" "}
                        {new Date(product.boughtDate).toLocaleDateString()})
                    </li>
                ))}
            </ul>

            <div>
                <strong>Total Price: ${calculateTotalPrice().toFixed(2)}</strong>
            </div>

            <div ref={observeLoadMoreTrigger} style={{ height: "10px", margin: "0 0" }} />

            {loading && <p>Loading...</p>}
        </div>
    );
};

export default ProductList;
