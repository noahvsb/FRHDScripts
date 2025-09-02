import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import java.util.ArrayList;
import java.util.List;

public class ImageProcessing {
    public static Mat readImage(String imagePath, boolean grayscale) {
        Mat image = Imgcodecs.imread(imagePath, grayscale ? Imgcodecs.IMREAD_GRAYSCALE : Imgcodecs.IMREAD_UNCHANGED);
        if (image.empty())
            throw new RuntimeException("Image not found");
        return image;
    }

    public static List<RLERun> processImage(Mat image, int blackThreshold, int grayThreshold) {
        Point[] grayPixels = new Point[2];
        Point[] blackPixels = new Point[2];

        Mat grayImage = new Mat();

        // convert to grayscale if necessary
        if (image.type() != CvType.CV_8UC1)
            Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
        else
            grayImage = image;

        List<RLERun> rleRuns = new ArrayList<>();

        for (int row = 0; row < grayImage.rows(); row++) {
            int count = 0;
            PixelColor currentColor = PixelColor.BLACK;
            for (int col = 0; col < grayImage.cols(); col++) {
                int pixelValue = (int) grayImage.get(row, col)[0];

                PixelColor color = pixelValue < blackThreshold ? PixelColor.BLACK
                        : pixelValue < grayThreshold ? PixelColor.GRAY : PixelColor.WHITE;

                if (color == currentColor)
                    count++;
                else {
                    if (count > 0) {
                        // check the number of neighbours
                        int neighbours = 0;
                        if (col - count > 0) neighbours++; // left neighbour
                        if (col < grayImage.cols() - 1) neighbours++; // right neighbour

                        // adjust the run coordinates if there are fewer than 2 neighbours
                        int startX = col - count + 1 + (neighbours < 2 ? 2 : 0);

                        int[] xValues = new int[count];
                        for (int i = 0; i < count; i++)
                            xValues[i] = startX + i; // set adjusted startX

                        rleRuns.add(new RLERun(row, xValues, currentColor));
                    }
                    currentColor = color;
                    count = 1;
                }
            }

            if (count > 0) {
                // check the number of neighbours of the last run
                int neighbours = 0;
                if (grayImage.cols() - count > 0) neighbours++; // left neighbour
                if (grayImage.cols() - 1 < grayImage.cols()) neighbours++; // right neighbour

                // adjust the run coordinates if there are fewer than 2 neighbours
                int startX = image.cols() - count + (neighbours < 2 ? 2 : 0);

                int[] xValues = new int[count];
                for (int i = 0; i < count; i++)
                    xValues[i] = startX + i; // set adjusted startX

                rleRuns.add(new RLERun(row, xValues, currentColor));
            }
        }

        return rleRuns;
    }
}
