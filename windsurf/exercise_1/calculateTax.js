const calculateTax = (amount, taxRate) => {
    const tax = amount * taxRate;
    return amount + tax;
};

const addSum = (...numbers) => {
    return numbers.reduce((sum, num) => sum + num, 0);
};

export default calculateTax;
export { addSum };
