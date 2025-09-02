import org.opencv.core.*;
import java.util.List;

public class Main {

    static {
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
    }

    public static void main(String[] args) {
        String imagePath = args[0];

        Mat imageData = ImageProcessing.readImage(imagePath, false);

        List<RLERun> rleRuns = ImageProcessing.processImage(imageData, 100, 190);

        StringBuilder output = new StringBuilder();

        for (RLERun run : rleRuns)
            if (run.color() == PixelColor.BLACK && run.xValues().length > 0)
                output.append(getLine(run));

        output.append("#");

        for (RLERun run : rleRuns)
            if (run.color() == PixelColor.GRAY && run.xValues().length > 0)
                output.append(getLine(run));

        System.out.println(output.append("#"));
    }

    public static String getLine(RLERun run) {
        int x1 = run.xValues()[0]; // first x-coordinate
        int x2 = run.xValues()[run.xValues().length - 1]; // last x-coordinate
        int y = run.y(); // y-coordinate
        return Encoding.encodeLine(x1, y, x2, y);
    }
}
