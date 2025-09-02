public record RLERun(int y, int[] xValues, PixelColor color) {
    @Override
    public String toString() {
        StringBuilder s = new StringBuilder(y + ": ");

        for (int i = 0; i < xValues.length; i++) {
            if (i > 0)
                s.append(", ");
            s.append(xValues[i]);
        }

        s.append("(Color: ").append(color.toString()).append(")");

        return s.toString();
    }
}
