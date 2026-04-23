from flask import Flask, jsonify, request
import csv
import os

app = Flask(__name__)
data = []

@app.route("/form", methods=["POST"])
def handle_form():
    quantity = float(request.form.get("quantity",4132))
    date = request.form.get("date","30-10-2025")
    name = request.form.get("name","Wheat")
    # quantity = 4132
    # date = 30-10-2025
    # name = "Wheat"
    algo1(name)
    price = algo2(quantity, date)
    return jsonify({"best_price": price})


def algo1(name):
    global data
    data.clear()  # clear old data before reloading

    file_path = r"AgricultureData_IndianSuppliers_v2.csv"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, "r", newline='', encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # skip header line

        for row in reader:
            if row[1].lower() == name.lower():
                try:
                    parts = row[9].split("-")
                    day = int(parts[1]) / 12
                    quantity_val = float(row[4])
                    price_val = float(row[3])
                    data.append([day, quantity_val, price_val])
                except Exception as e:
                    print("Error parsing row:", e)

def algo2(quantity, date):
    if not data:
        return 0

    try:
        parts = date.split("-")
        day = int(parts[1]) / 12
    except:
        return 0

    min_dist = []
    for d in data:
        dist = (d[0] - day) ** 2 + (d[1] - quantity) ** 2
        min_dist.append(dist)

    price = 0
    used = set()
    for _ in range(min(int(0.1*len(min_dist)), len(min_dist))):
        min_val = min(min_dist)
        idx = min_dist.index(min_val)
        price += data[idx][2]
        min_dist[idx] = float("inf")  # mark used

    return round((price*90) / int(0.1*len(min_dist)), 2)


if __name__ == "__main__":
    app.run(port=5001, debug=False)
